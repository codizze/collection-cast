import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  MessageSquare, Send, MoreVertical, Edit, Trash2, User, Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  content: string;
  author_name: string;
  product_id?: string;
  collection_id?: string;
  task_id?: string;
  created_at: string;
  updated_at: string;
}

interface CommentsSectionProps {
  entityType: 'product' | 'collection' | 'task';
  entityId: string;
  entityName?: string;
}

const CommentsSection = ({ entityType, entityId, entityName }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editContent, setEditContent] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
    // Load author name from localStorage
    const savedAuthor = localStorage.getItem('comment_author_name');
    if (savedAuthor) {
      setAuthorName(savedAuthor);
    }
  }, [entityType, entityId]);

  const fetchComments = async () => {
    try {
      let query = supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: true });

      switch (entityType) {
        case 'product':
          query = query.eq('product_id', entityId);
          break;
        case 'collection':
          query = query.eq('collection_id', entityId);
          break;
        case 'task':
          query = query.eq('task_id', entityId);
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os comentários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !authorName.trim()) {
      toast({
        title: "Erro",
        description: "Preencha o nome e o comentário.",
        variant: "destructive",
      });
      return;
    }

    try {
      const commentData: any = {
        content: newComment,
        author_name: authorName,
      };

      switch (entityType) {
        case 'product':
          commentData.product_id = entityId;
          break;
        case 'collection':
          commentData.collection_id = entityId;
          break;
        case 'task':
          commentData.task_id = entityId;
          break;
      }

      const { error } = await supabase
        .from('comments')
        .insert([commentData]);

      if (error) throw error;

      // Save author name to localStorage
      localStorage.setItem('comment_author_name', authorName);

      setNewComment("");
      fetchComments();
      
      toast({
        title: "Sucesso",
        description: "Comentário adicionado!",
      });
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário.",
        variant: "destructive",
      });
    }
  };

  const handleEditComment = async (comment: Comment) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editContent })
        .eq('id', comment.id);

      if (error) throw error;

      setEditingComment(null);
      setEditContent("");
      fetchComments();
      
      toast({
        title: "Sucesso",
        description: "Comentário atualizado!",
      });
    } catch (error) {
      console.error('Erro ao editar comentário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível editar o comentário.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      fetchComments();
      
      toast({
        title: "Sucesso",
        description: "Comentário excluído!",
      });
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o comentário.",
        variant: "destructive",
      });
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Carregando comentários...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comentários {entityName && `- ${entityName}`}
          <Badge variant="secondary">{comments.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New Comment Form */}
        <form onSubmit={handleSubmitComment} className="space-y-3 p-4 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="author_name" className="text-xs">Seu nome</Label>
              <Input
                id="author_name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Digite seu nome"
                className="h-8"
                required
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label htmlFor="new_comment" className="text-xs">Novo comentário</Label>
              <div className="flex gap-2">
                <Textarea
                  id="new_comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Digite seu comentário..."
                  rows={2}
                  className="resize-none"
                  required
                />
                <Button type="submit" size="sm" className="self-end">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-3">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum comentário ainda.</p>
              <p className="text-sm">Seja o primeiro a comentar!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4 bg-background">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium text-sm">{comment.author_name}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(comment.created_at)}
                        {comment.updated_at !== comment.created_at && (
                          <span className="ml-1">(editado)</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startEdit(comment)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {editingComment?.id === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleEditComment(comment)}
                      >
                        Salvar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={cancelEdit}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentsSection;